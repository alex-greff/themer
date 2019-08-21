import Utilities from "../utilities";

export default {
    name: "string",
    validator: (val) => {
        return Utilities.isString(val);
    }
};