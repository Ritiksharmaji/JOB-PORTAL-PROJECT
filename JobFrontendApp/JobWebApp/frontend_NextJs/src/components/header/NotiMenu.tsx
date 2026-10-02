'use client';

import { Indicator, Menu, Notification, rem } from '@mantine/core';
import { IconBell, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { notificationApi } from '@/lib/api/services';
import { useAppStore } from '@/store/app-store-provider';
import type { AppNotification } from '@/types';

export default function NotiMenu() {
  const router = useRouter();
  const userId = useAppStore((s) => s.user?.id);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    notificationApi
      .getNotifications(userId)
      .then((list) => active && setNotifications(list))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId]);

  const markRead = (noti: AppNotification) => {
    setNotifications((list) => list.filter((n) => n.id !== noti.id));
    notificationApi.markAsRead(noti.id).catch(() => {});
  };

  return (
    <Menu shadow="md" width={400} opened={opened} onChange={setOpened}>
      <Menu.Target>
        <button type="button" className="rounded-full bg-mine-shaft-900 p-1.5" aria-label={`Notifications (${notifications.length})`}>
          <Indicator disabled={notifications.length === 0} color="brightSun.4" offset={6} size={8} processing>
            <IconBell stroke={1.5} />
          </Indicator>
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        <div className="flex flex-col gap-1">
          {notifications.map((noti) => (
            <Notification
              key={noti.id}
              className="cursor-pointer hover:bg-mine-shaft-900"
              icon={<IconCheck style={{ width: rem(20), height: rem(20) }} />}
              color="teal"
              title={noti.action}
              mt="md"
              onClick={() => {
                setOpened(false);
                markRead(noti);
                if (noti.route) router.push(noti.route);
              }}
              onClose={() => markRead(noti)}
            >
              {noti.message}
            </Notification>
          ))}
          {notifications.length === 0 && <div className="text-center text-mine-shaft-300">No Notifications</div>}
        </div>
      </Menu.Dropdown>
    </Menu>
  );
}
