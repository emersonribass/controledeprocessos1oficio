
type InfoItemProps = {
  label: string;
  value: string;
};

export const InfoItem = ({ label, value }: InfoItemProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {label}
      </h3>
      <p className="font-medium">
        {value}
      </p>
    </div>
  );
};
