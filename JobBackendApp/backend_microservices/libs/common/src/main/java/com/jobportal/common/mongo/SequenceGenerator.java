package com.jobportal.common.mongo;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import com.jobportal.common.error.JobPortalException;

/**
 * Numeric IDs like the monolith (users 1, 2, 3…). Each service keeps its own "sequence" collection in
 * its own database, so the counters never collide across services.
 */
@Component
public class SequenceGenerator {

	private final MongoOperations mongo;

	public SequenceGenerator(MongoOperations mongo) {
		this.mongo = mongo;
	}

	public Long next(String key) throws JobPortalException {
		Sequence s = mongo.findAndModify(Query.query(Criteria.where("_id").is(key)), new Update().inc("seq", 1),
				FindAndModifyOptions.options().returnNew(true).upsert(true), Sequence.class);
		if (s == null) throw new JobPortalException("Unable to get sequence id for key : " + key);
		return s.getSeq();
	}
}
