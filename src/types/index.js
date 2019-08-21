import anyType from "./any.type";
import numberType from "./number.type";
import integerType from "./integer.type";
import stringType from "./string.type";
import booleanType from "./boolean.type";
import colorType from "./color.type";
import lengthType from "./length.type";
import rotationType from "./rotation.type";

export default {
    [anyType.name]: anyType,
    [numberType.name]: numberType,
    [integerType.name]: integerType,
    [stringType.name]: stringType,
    [booleanType.name]: booleanType,
    [colorType.name]: colorType,
    [lengthType.name]: lengthType,
    [rotationType.name]: rotationType,
};