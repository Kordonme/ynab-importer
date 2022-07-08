import classnames from "classnames";
import { TextInputLabelProps } from "./TextInputLabel.props";

export const TextInputLabel = (props: TextInputLabelProps) => {
  const { className, ...rest } = props;

  const classNames = classnames(
    className,
    "block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
  );

  return <label className={classNames} {...rest} />;
};
