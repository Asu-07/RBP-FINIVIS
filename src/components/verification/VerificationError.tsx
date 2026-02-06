interface Props {
  reason?: string | null;
}

export const VerificationError = ({ reason }: Props) => {
  if (!reason) return null;

  return (
    <p className="text-xs text-red-600 mt-1">
      Verification failed: {reason}
    </p>
  );
};