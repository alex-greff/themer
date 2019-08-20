import Utilities from "../utilities";

export default {
    name: "color",
    validator: (val) => {
        return Utilities.isRGB(val) 
            || Utilities.isHSL(val) 
            || Utilities.isHex(val)
            || Utilities.isColorName(val);
    }
};