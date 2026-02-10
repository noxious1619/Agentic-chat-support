export type AgentType = 'support' | 'order' | 'billing';

export function routeMessage(message: string): AgentType {
  const text = message.toLowerCase();

  if (
    text.includes('order') || 
    text.includes('delivery')) {
      return 'order';
  }

  if (
    text.includes('payment') || 
    text.includes('refund') ||
    text.includes('billing')
  ) {
    return 'billing';
  }

  return 'support';
}
