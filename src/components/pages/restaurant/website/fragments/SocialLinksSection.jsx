"use client";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";

const SocialLinksSection = ({ formik }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/50 pb-4">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Social Links</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Connect your social media accounts to display on your storefront.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="relative group">
          <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-900 z-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Facebook URL</span>
          </div>
          <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900/50">
            <div className="pl-3.5 flex items-center pointer-events-none">
              <Link2 className="h-5 w-5 text-primary/90" />
            </div>
            <Input 
              id="socialLinks.facebook" 
              name="socialLinks.facebook"
              value={formik.values.socialLinks.facebook} 
              onChange={formik.handleChange} 
              onBlur={formik.handleBlur}
              placeholder="https://facebook.com/yourrestaurant" 
              className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-base px-3 w-full" 
            />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-900 z-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Instagram URL</span>
          </div>
          <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900/50">
            <div className="pl-3.5 flex items-center pointer-events-none">
              <Link2 className="h-5 w-5 text-primary/90" />
            </div>
            <Input 
              id="socialLinks.instagram" 
              name="socialLinks.instagram"
              value={formik.values.socialLinks.instagram} 
              onChange={formik.handleChange} 
              onBlur={formik.handleBlur}
              placeholder="https://instagram.com/yourrestaurant" 
              className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-base px-3 w-full" 
            />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-zinc-900 z-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-primary transition-colors">Twitter / X URL</span>
          </div>
          <div className="relative flex items-center border border-gray-300 dark:border-gray-700 rounded-md focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary transition-all bg-white dark:bg-zinc-900/50">
            <div className="pl-3.5 flex items-center pointer-events-none">
              <Link2 className="h-5 w-5 text-primary/90" />
            </div>
            <Input 
              id="socialLinks.twitter" 
              name="socialLinks.twitter"
              value={formik.values.socialLinks.twitter} 
              onChange={formik.handleChange} 
              onBlur={formik.handleBlur}
              placeholder="https://twitter.com/yourrestaurant" 
              className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-base px-3 w-full" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinksSection;
