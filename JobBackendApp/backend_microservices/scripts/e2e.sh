#!/usr/bin/env bash
# End-to-end test through the API gateway (stack must be running: scripts/up.sh).
# Creates fresh accounts each run, so it can be re-run any time. Exit code = number of failures.
set -uo pipefail
cd "$(dirname "$0")/.."
G="${GATEWAY_URL:-http://localhost:8080}"; H='Content-Type: application/json'
RUN=$(date +%s); PW='Test1pass@x'; REC="rec$RUN@e2e.test"; SEEK="seek$RUN@e2e.test"; OTHER="other$RUN@e2e.test"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "  PASS  $1"; else fail=$((fail+1)); echo "  FAIL  $1  (expected '$3', got '$2')"; fi; }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
json() { python3 -c "import sys,json; d=json.load(sys.stdin); print($1)" 2>/dev/null; }
reg() { curl -s -X POST "$G/users/register" -H "$H" -d "{\"name\":\"$1\",\"email\":\"$2\",\"password\":\"$PW\",\"accountType\":\"$3\"}"; }
login() { curl -s -X POST "$G/auth/login" -H "$H" -d "{\"email\":\"$1\",\"password\":\"${2:-$PW}\"}" | json 'd["jwt"]'; }

echo "Accounts"
RID=$(reg "E2E Recruiter" "$REC" EMPLOYER | json 'd["id"]'); SID=$(reg "E2E Seeker" "$SEEK" APPLICANT | json 'd["id"]'); OID=$(reg "E2E Other" "$OTHER" APPLICANT | json 'd["id"]')
check "register 3 users (profiles created by profile-service)" "$([ -n "$RID" ] && [ -n "$SID" ] && [ -n "$OID" ] && echo ok)" ok
check "duplicate email rejected" "$(reg x "$REC" APPLICANT | json 'd["errorMessage"]')" "Email registered already."
RT=$(login "$REC"); ST=$(login "$SEEK"); OT=$(login "$OTHER")
check "login returns JWTs" "$([ ${#RT} -gt 100 ] && [ ${#ST} -gt 100 ] && echo ok)" ok
check "wrong password" "$(code -X POST "$G/auth/login" -H "$H" -d "{\"email\":\"$REC\",\"password\":\"Wrong1@xx\"}")" 500

echo "Jobs"
check "job seeker cannot post" "$(curl -s -X POST "$G/jobs/post" -H "$H" -H "Authorization: Bearer $ST" -d '{"id":0,"jobTitle":"x"}' | json 'd["errorMessage"]')" "You are not allowed to do this."
JOB=$(curl -s -X POST "$G/jobs/post" -H "$H" -H "Authorization: Bearer $RT" -d '{"id":0,"jobTitle":"E2E Engineer","company":"Google","jobStatus":"ACTIVE","postedBy":1}')
JID=$(echo "$JOB" | json 'd["id"]')
check "recruiter posts; postedBy taken from token, not body" "$(echo "$JOB" | json 'd["postedBy"]')" "$RID"
check "visitor can browse jobs" "$(code "$G/jobs/get/$JID")" 200
check "seeker applies (spoofed applicantId ignored)" "$(curl -s -X POST "$G/jobs/apply/$JID" -H "$H" -H "Authorization: Bearer $ST" -d '{"applicantId":1,"name":"E2E Seeker","email":"'$SEEK'","resume":"cmVzdW1l"}' | json 'd["message"]')" "Applied Successfully"
check "second application rejected" "$(curl -s -X POST "$G/jobs/apply/$JID" -H "$H" -H "Authorization: Bearer $ST" -d '{}' | json 'd["errorMessage"]')" "Already Applied to this Job."
check "visitor sees applicant count only" "$(curl -s "$G/jobs/get/$JID" | json '[a["email"] for a in d["applicants"]]')" "[None]"
check "other seeker sees no personal data" "$(curl -s "$G/jobs/get/$JID" -H "Authorization: Bearer $OT" | json '[a["email"] for a in d["applicants"]]')" "[None]"
check "poster sees applicant details" "$(curl -s "$G/jobs/get/$JID" -H "Authorization: Bearer $RT" | json '[a["email"] for a in d["applicants"]]')" "['$SEEK']"
check "seeker's own history" "$(curl -s "$G/jobs/history/$SID/APPLIED" -H "Authorization: Bearer $ST" | json 'len([j for j in d if j["id"]=='$JID'])')" 1
check "cannot read someone else's history" "$(curl -s "$G/jobs/history/$SID/APPLIED" -H "Authorization: Bearer $OT" | json 'd["errorMessage"]')" "You are not allowed to do this."
check "non-poster cannot change status" "$(curl -s -X POST "$G/jobs/changeAppStatus" -H "$H" -H "Authorization: Bearer $OT" -d '{"id":'$JID',"applicantId":'$SID',"applicationStatus":"OFFERED"}' | json 'd["errorMessage"]')" "You are not allowed to do this."
check "poster schedules interview" "$(curl -s -X POST "$G/jobs/changeAppStatus" -H "$H" -H "Authorization: Bearer $RT" -d '{"id":'$JID',"applicantId":'$SID',"applicationStatus":"INTERVIEWING","interviewTime":"2026-12-01T10:00:00"}' | json 'd["message"]')" "Status Chhanged Successfully"

echo "Notifications (RabbitMQ)"
sleep 3
check "recruiter got 'Job Posted'" "$(curl -s "$G/notification/get/$RID" -H "Authorization: Bearer $RT" | json '"Job Posted" in [n["action"] for n in d]')" True
check "seeker got 'Interview Scheduled'" "$(curl -s "$G/notification/get/$SID" -H "Authorization: Bearer $ST" | json '"Interview Scheduled" in [n["action"] for n in d]')" True
check "cannot read others' notifications" "$(curl -s "$G/notification/get/$RID" -H "Authorization: Bearer $ST" | json 'd["errorMessage"]')" "You are not allowed to do this."

echo "Profiles"
PID=$(curl -s "$G/profiles/getAll" | json '[p["id"] for p in d if p["name"]=="E2E Seeker"][-1]')
check "visitor does not see emails" "$(curl -s "$G/profiles/get/$PID" | json 'd["email"]')" None
check "logged-in user sees email" "$(curl -s "$G/profiles/get/$PID" -H "Authorization: Bearer $RT" | json 'd["email"]')" "$SEEK"
check "cannot edit someone else's profile" "$(curl -s -X PUT "$G/profiles/update" -H "$H" -H "Authorization: Bearer $OT" -d '{"id":'$PID',"name":"Hacked"}' | json 'd["errorMessage"]')" "You can only edit your own profile."
check "owner edits profile" "$(curl -s -X PUT "$G/profiles/update" -H "$H" -H "Authorization: Bearer $ST" -d '{"id":'$PID',"name":"E2E Seeker","jobTitle":"QA","savedJobs":['$JID']}' | json 'd["jobTitle"]')" QA

echo "Gateway security"
check "protected route without token -> 401" "$(code "$G/jobs/history/$SID/APPLIED")" 401
check "forged X-User headers without token -> 401" "$(code -X POST "$G/jobs/post" -H "$H" -H 'X-User-Id: 1' -H 'X-User-Role: ADMIN' -d '{}')" 401
check "internal routes not exposed" "$(code -X POST "$G/internal/profiles" -H "$H" -d '{}')" 404
# Forge a token: same signature, payload changed to claim another user's id and ADMIN.
FORGED=$(python3 - "$ST" <<'PY'
import sys, json, base64
h, p, s = sys.argv[1].split(".")
claims = json.loads(base64.urlsafe_b64decode(p + "=" * (-len(p) % 4)))
claims.update(id=1, accountType="ADMIN")
print(h + "." + base64.urlsafe_b64encode(json.dumps(claims).encode()).decode().rstrip("=") + "." + s)
PY
)
check "tampered token (changed claims) -> 401" "$(code "$G/jobs/history/$SID/APPLIED" -H "Authorization: Bearer $FORGED")" 401

echo "Password reset"
NEWPW='Newpass1@x'; RESET="{\"email\":\"$SEEK\",\"password\":\"$NEWPW\"}"
check "reset without OTP blocked" "$(curl -s -X POST "$G/users/changePass" -H "$H" -d "$RESET" | json 'd["errorMessage"]')" "Verify the OTP sent to your email before changing the password."
curl -s -X POST "$G/users/sendOtp/$SEEK" >/dev/null; sleep 1
OTP=$(docker compose logs --since 30s user-service 2>/dev/null | grep -oE "OTP for $SEEK is [0-9]{6}" | tail -1 | grep -oE '[0-9]{6}$')
check "verify OTP (read from logs; mail not configured)" "$(curl -s "$G/users/verifyOtp/$SEEK/$OTP" | json 'd["message"]')" "OTP has been verified."
check "reset after verification" "$(curl -s -X POST "$G/users/changePass" -H "$H" -d "$RESET" | json 'd["message"]')" "Password changed successfully."
NEWTOKEN=$(login "$SEEK" "$NEWPW")
check "login with new password" "$([ ${#NEWTOKEN} -gt 100 ] && echo ok)" ok
check "same OTP cannot be reused" "$(curl -s -X POST "$G/users/changePass" -H "$H" -d "$RESET" | json 'd["errorMessage"]')" "Verify the OTP sent to your email before changing the password."

echo; echo "$pass passed, $fail failed"
exit $fail
