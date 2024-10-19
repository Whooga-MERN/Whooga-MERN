import { Switch } from "@headlessui/react";
import { IoEarthOutline } from "react-icons/io5";
import { BsHouseDoor } from "react-icons/bs";

interface OwnedToggleProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  onToggle: (enabled: boolean) => void;
}

export default function OwnedToggle({
  enabled,
  setEnabled,
  onToggle,
}: OwnedToggleProps) {
  const handleChange = (enabled: boolean) => {
    setEnabled(enabled);
    onToggle(enabled);
  };
  return (
    <Switch
      checked={enabled}
      onChange={handleChange}
      className={`group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 ${
        enabled ? "bg-yellow-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in ${
            enabled ? "opacity-0 duration-100 ease-out" : "opacity-100"
          }`}
        >
          <IoEarthOutline />
        </span>
        <span
          aria-hidden="true"
          className={`absolute inset-0 flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out ${
            enabled ? "opacity-100 duration-200 ease-in" : "opacity-0"
          }`}
        >
          <svg
            fill="currentColor"
            viewBox="0 0 12 12"
            className="h-3 w-3 text-yellow-600"
          >
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </Switch>
  );
}
