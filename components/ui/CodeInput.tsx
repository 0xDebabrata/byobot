interface IProps {
  validate: {};
  className: string;
}

function CodeInput({ className, validate }: IProps) {
  return (
    <div>
      <textarea
        name="spec"
        placeholder="Enter API Spec"
        rows={10}
        {...validate}
        className={className}
        style={{
          fontFamily:
            "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace"
        }}
      />
    </div>
  );
}

export default CodeInput;
