export default function NoteCountLabel({ count }: { count: number }) {
  return (
    <span className="font-display text-[25px] leading-none font-semibold text-[#595959] dark:text-neutral-300">
      {`${count} Note${count === 1 ? '' : 's'}`}
    </span>
  );
}
