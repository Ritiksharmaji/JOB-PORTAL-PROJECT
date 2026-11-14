import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

export function successNotification(title: string, message: string) {
  notifications.show({
    title,
    message,
    withCloseButton: true,
    icon: <IconCheck style={{ width: '90%', height: '90%' }} />,
    color: 'teal',
    withBorder: true,
    className: 'border-green-500!',
  });
}

export function errorNotification(title: string, message: string) {
  notifications.show({
    title,
    message,
    withCloseButton: true,
    icon: <IconX style={{ width: '90%', height: '90%' }} />,
    color: 'red',
    withBorder: true,
    className: 'border-red-500!',
  });
}
