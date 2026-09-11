import { User, Camera, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

export function AvatarUpload({ formik, isUploading, handleImageUpload }) {
    const previewUrl = getImageUrl(formik.values.image);

    return (
        <div className="flex flex-col items-center justify-center pt-2 pb-4">
            <div className="relative group/avatar cursor-pointer">
                <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    id="staff-image-upload"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                />
                <label 
                    htmlFor="staff-image-upload" 
                    className={`block relative w-28 h-28 rounded-md border-4 border-white dark:border-zinc-950 shadow-md overflow-hidden bg-gray-50 dark:bg-zinc-900 cursor-pointer transition-all duration-300 ${isUploading ? 'opacity-50 pointer-events-none' : 'group-hover/avatar:shadow-xl group-hover/avatar:border-orange-100'}`}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <User size={32} strokeWidth={1.5} />
                        </div>
                    )}
                
                    <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-opacity duration-300 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover/avatar:opacity-100'}`}>
                         {isUploading ? (
                             <Loader2 className="w-6 h-6 text-white animate-spin" />
                         ) : (
                             <>
                                 <Camera className="w-6 h-6 text-white mb-1" />
                                 <span className="text-[9px] font-bold text-white uppercase tracking-wider">Upload</span>
                             </>
                         )}
                    </div>
                </label>
            </div>
            {formik.values.image && !isUploading && (
                <button 
                    type="button" 
                    onClick={() => {
                        formik.setFieldValue("image", null);
                    }}
                    className="mt-3 text-xs font-semibold text-red-500 hover:text-red-600 uppercase tracking-wider"
                >
                    Remove Photo
                </button>
            )}
        </div>
    );
}
