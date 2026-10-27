import type { ReactNode } from "react";
import type { Chapter as NewsChapter } from "../../worldhistory/kit/news";

// The news-kit chapter contract plus a slot for library sound (<Bed>, <Hit>), which the synthetic `sfx` list can't hold.
export type Chapter = NewsChapter & { Sound?: () => ReactNode };
