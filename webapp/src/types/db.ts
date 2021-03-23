
export enum CollectionsNames {
    betaCodes = 'betaCodes'
}

/**
 * firebase where 
 */
export interface WhereClause {
    el1: string,
    op: string,
    el2: string | number | boolean
}

/**
 * firebase get 
 */
export interface Get {
    collection: CollectionsNames;
    id: string;
}

/**
 * firebase list 
 */
export interface List {
    collection: CollectionsNames;
    where?: WhereClause;
}

/**
 * firebase insert 
 */
export interface Insert {
    collection: CollectionsNames;
    payload: any;
}
/**
 * firebase delete 
 */
export interface Remove {
    collection: CollectionsNames;
    id: string;
}

/**
 * firebase update 
 */
export interface Update {
    collection: CollectionsNames;
    payload: any;
    id: string;
}
