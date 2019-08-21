import Utilities from "../utilities";

export default {
    name: "number",
    validator: (val) => {
        return Utilities.isNumber(val);
    }
};