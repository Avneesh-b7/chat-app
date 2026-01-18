// In-memory user-to-socket mapping
const onlineUsers = new Map<string, string>(); // userId -> socketId

export function addOnlineUser(userId: string, socketId: string): void {
  onlineUsers.set(userId, socketId);
}

export function removeOnlineUser(userId: string): void {
  onlineUsers.delete(userId);
}

export function getSocketIdByUserId(userId: string): string | undefined {
  return onlineUsers.get(userId);
}

export function getAllOnlineUserIds(): string[] {
  return Array.from(onlineUsers.keys());
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}
