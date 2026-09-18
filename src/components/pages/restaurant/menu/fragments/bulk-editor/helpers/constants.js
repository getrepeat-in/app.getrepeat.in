import { AlignLeft, DollarSign, FileUp, ImageIcon, Layers, PlusCircle } from "lucide-react";

export const BULK_EDIT_MODES = [
    { 
        id: "PRICE", 
        icon: DollarSign, 
        label: "Price Editor", 
        category: "EDITORS"
    },
    { 
        id: "STRUCTURE", 
        icon: Layers, 
        label: "Structure Organizer", 
        category: "EDITORS"
    },
    { 
        id: "ADDONS", 
        icon: PlusCircle, 
        label: "Addons Builder", 
        category: "EDITORS"
    },
    { 
        id: "DESCRIPTION", 
        icon: AlignLeft, 
        label: "Description Editor", 
        category: "EDITORS"
    },
    { 
        id: "IMAGE", 
        icon: ImageIcon, 
        label: "Image Editor", 
        category: "EDITORS"
    },
    { 
        id: "IMPORT", 
        icon: FileUp, 
        label: "Import Menu", 
        category: "DATA"
    },
];