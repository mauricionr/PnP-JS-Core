"use strict";

import { IListInstance } from "./IListInstance";
import { ICustomAction } from "./ICustomAction";
import { IFeature } from "./IFeature";
import { IFile } from "./IFile";
import { INavigation } from "./inavigation";
import { IComposedLook } from "./IComposedLook";
import { IWebSettings } from "./IWebSettings";

export interface SiteSchema {
    Lists: Array<IListInstance>;
    Files: Array<IFile>;
    Navigation: INavigation;
    CustomActions: Array<ICustomAction>;
    ComposedLook: IComposedLook;
    PropertyBagEntries: Object;
    Parameters: Object;
    WebSettings: IWebSettings;
    Features: Array<IFeature>;
}
