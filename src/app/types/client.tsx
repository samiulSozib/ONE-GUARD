export interface Client {
  id: number;                     // Row number
  name: string;                   // Client name
  idNumber: string;               // ID Number (e.g., #CLI-0006)
  phoneNumber: string;            // Phone Number
  email: string;                  // Email address
  city: string;                   // City
  state: string;                  // State
  country: string;                // Country
  contractStartDate: string;      // Contract start date
  contractEndDate: string;        // Contract end date
  contractStatus: 'Running' | 'Pending' | 'Completed'; // Contract status
  avatar: string;                 // Avatar image URL
}


export interface ViewClientTopCardProps {
  client: Client;
}