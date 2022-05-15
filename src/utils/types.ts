export type Subscription = {
  owner: string;
  title: string;
  subscriptionType: string;
  monthlyRate: number;
  flowRate: string | undefined;
};
