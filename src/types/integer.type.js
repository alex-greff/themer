import Utilities from "../utilities";

export default {
    name: "integer",
    validator: (val) => {
        return Utilities.isInteger(val);
    }
};