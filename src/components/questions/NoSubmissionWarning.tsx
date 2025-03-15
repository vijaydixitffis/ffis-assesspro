
import React from "react";
import { AlertCircle } from "lucide-react";

export function NoSubmissionWarning() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start mt-4">
      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-medium text-yellow-800">Start Assessment First</h4>
        <p className="text-yellow-700 text-sm">
          You need to start the assessment before you can submit answers.
          Please go back to My Assessments and click the "Start" button.
        </p>
      </div>
    </div>
  );
}
