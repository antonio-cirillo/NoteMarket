const EMAIL_REGEX = /^[a-zA-Z0-9]{1}[.!#$%&'*+/=?^_`{|}~a-zA-Z0-9-]{0,99}@[a-zA-Z0-9]{1,46}\.[a-zA-Z]{2,4}$/;

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,16}$/;

const NAME_SURNAME_REGEX = /^[A-Za-z][a-zA-Z\s]{1,13}[A-Za-z]$/;

const COMMENT_REGEX = /[a-zA-Z0-9@=\-'"]{3,256}/