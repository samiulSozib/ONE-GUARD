export interface MessageContact {
  id: number;
  name: string;
  company?: string;        // (Optional, because only some cards show company)
  role: string;
  email: string;
  phone: string;
  location: string;
  image: string;           // URL or local path
  last_message:string
}

export interface ViewMessageContactTopCardProps {
  messageContact: MessageContact;
}