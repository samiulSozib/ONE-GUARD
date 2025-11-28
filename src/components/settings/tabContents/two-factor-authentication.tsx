import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const TwoFactorAuthentication = () => {
  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-700">

      {/* Header Notice */}
      <div className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-4 py-3 rounded-lg mb-6">
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          Two-factors authentication is currently{" "}
          <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-100 rounded-md text-xs">
            Disabled
          </span>
          . To enable:
        </span>
      </div>

      {/* Step 1 */}
      <div className="mb-6">
        <p className="font-semibold text-sm mb-2 dark:text-white">Step 1 :  
          <span className="font-normal ml-1 dark:text-gray-300">
            Open your OTP app and scan the following QR-code
          </span>
        </p>

        <div className="w-40 h-40 border dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Avatar className="w-40 h-40">
            {/* Replace placeholder with your QR code URL */}
            <AvatarImage src="/qr-code-example.png" alt="QR Code" />
          </Avatar>
        </div>
      </div>

      {/* Step 2 */}
      <div className="mb-4">
        <p className="font-semibold text-sm mb-2 dark:text-white">Step 2 :  
          <span className="font-normal ml-1 dark:text-gray-300">
            Generate a One Time Password (OTP) and enter the value below
          </span>
        </p>

        <FloatingLabelInput label="Enter here..." />
      </div>

      {/* Verify Button */}
      <div className="flex justify-end mt-4">
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6">Verify</Button>
      </div>
    </div>
  );
};

export default TwoFactorAuthentication;