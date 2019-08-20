import Utilities from "../utilities";

export default {
    name: "rotation",
    validator: (val) => {
        return Utilities.isCSSRotation(val);
    }
}