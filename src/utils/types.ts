export type Service = {
  owner: string;
  title: string;
  active: boolean;
  subscriptionType: string;
  monthlyRate: number;
  date: Date;
  flowRate: string | undefined;
};

export type Subscription = {
  service: string;
  subscriber: string;
  handle: string;
  active: boolean;
  monthlyRate: number;
  date: Date;
};
