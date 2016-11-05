"use strict";

import { IContents } from "./IContents";

export interface IWebPart {
    Title: string;
    Order: number;
    Zone: string;
    Row: number;
    Column: number;
    Contents: IContents;
}
