export type Role = 'user' | 'agent';

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  messages: Message[];
};
