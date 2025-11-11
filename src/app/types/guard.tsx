
export interface Guard {
    id: number;
    name: string;
    _id: string;
    idNumber: string;
    type: string;
    cardNumber: string;
    phoneNumber: string;
    driverLicenseNumber: string;
    issuingState: string;
    city: string;
    checkInTime: string;
    status: string;
    locationRating: string;
    locationIcon: string;
    avatar: string;
}

export interface ViewGuardTopCardProps {
  guard: Guard;
}