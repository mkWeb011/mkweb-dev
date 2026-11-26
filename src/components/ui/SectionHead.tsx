import type { ReactNode } from 'react';

interface SectionHeadProps {
  index: string;
  /** Plain part of the heading. */
  title: string;
  /** Italic serif part, rendered after the title. */
  accent?: string;
  aside?: ReactNode;
  /** id of the <h2>, used by aria-labelledby on the <section>. */
  id: string;
}

/** The repeated "01 / Selected work — Heading — aside" row. */
export function SectionHead({ index, title, accent, aside, id }: SectionHeadProps) {
  return (
    <div className="sec-head" data-reveal="head">
      <span className="idx mono muted">{index}</span>
      <h2 id={id}>
        {title}
        {accent && (
          <>
            {' '}
            <span className="serif">{accent}</span>
          </>
        )}
      </h2>
      {aside && <span className="aside mono muted">{aside}</span>}
    </div>
  );
}
