export interface Vote {
  id: number;
  option_id: number;
  user_id: number;
}

export interface Option {
  id: number;
  option_text: string;
}

export interface Poll {
  id: number;
  admin: number;
  title: string;
  endsAt: string;
  description: string;
  options: Option[];
}

export interface VoteListItemProps {
  item: Poll;
  expanded: boolean;
  onToggle: () => void;
}
  