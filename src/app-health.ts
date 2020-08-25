export enum Status {
    OK = '😇',
    UNKNOWN = '🤔',
    ERROR = '😱',
}

export const dbHealth = {
        status: Status.UNKNOWN,
        stautsText: 'N/A',
};

export function setDBStatus(status: Status) {
    if (status == Status.OK) {
        dbHealth.status = Status.OK;
        dbHealth.stautsText = 'OK';
    }
    if (status == Status.UNKNOWN) {
        dbHealth.status = Status.UNKNOWN;
        dbHealth.stautsText = 'UNKNOWN';
    }
    if (status == Status.ERROR) {
        dbHealth.status = Status.ERROR;
        dbHealth.stautsText = 'ERROR';
    }
}
