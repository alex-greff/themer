import Utilities from "../utilities";

export default {
    name: "length",
    validator: (val) => {
        return Utilities.isCSSLength(val);
    }
};