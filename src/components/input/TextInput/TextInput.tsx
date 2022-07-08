import { TextInputProps } from "./TextInput.props";
import classnames from "classnames";

export const TextInput = (props: TextInputProps) => {
  const { className, ...rest } = props;

  const classNames = classnames(
    className,
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
  );

  return <input {...rest} className={classNames} />;
};
