import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import React, { useState } from "react";

const ChangePassword = () => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-700">

      <div className="space-y-6">

        {/* Old Password */}
        <div className="relative">
          <input
            type={showOld ? "text" : "password"}
            className="w-full border dark:border-gray-600 rounded-lg h-12 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Old Password"
          />
          <Eye
            className="absolute right-4 top-3.5 text-gray-500 dark:text-gray-400 cursor-pointer"
            onClick={() => setShowOld(!showOld)}
          />
        </div>

        {/* New Password */}
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            className="w-full border dark:border-gray-600 rounded-lg h-12 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="New Password"
          />
          <Eye
            className="absolute right-4 top-3.5 text-gray-500 dark:text-gray-400 cursor-pointer"
            onClick={() => setShowNew(!showNew)}
          />

          {/* Validation text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="inline-flex items-center gap-1">
              <span className="text-gray-600 dark:text-gray-300">ℹ</span> Password must be minimum 8+
            </span>
          </p>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            className="w-full border dark:border-gray-600 rounded-lg h-12 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Confirm New Password"
          />
          <Eye
            className="absolute right-4 top-3.5 text-gray-500 dark:text-gray-400 cursor-pointer"
            onClick={() => setShowConfirm(!showConfirm)}
          />
        </div>

      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
          Save Changes
        </Button>
      </div>

    </div>
  );
};

export default ChangePassword;