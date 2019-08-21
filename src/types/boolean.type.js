import Utilities from "../utilities";

export default {
    name: "boolean",
    validator: (val) => {
        return Utilities.isBoolean(val);
    }
};