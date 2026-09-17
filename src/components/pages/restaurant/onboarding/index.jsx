"use client";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateSlug } from "@/lib/client/helper";
import { onboardingValidationSchema } from "./helper";
import { useQueryClient } from "@tanstack/react-query";
import { useActiveUser } from "@/store/hooks/useActiveUser";
import useNotification from "@/store/hooks/useNotification";
import { RestaurantService } from "@/services/frontend/restaurant";
import { Store, Link2, Phone, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useActiveUser();
  const notification = useNotification();
  const [isSlugManual, setIsSlugManual] = useState(false);
 
  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "",
      phone: "",
      email: user?.email || "",
    },
    validationSchema: onboardingValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await RestaurantService.createRestaurant({
          ...values,
          name: values.name.trim(),
          slug: values.slug.trim().toLowerCase(),
          phone: values.phone.trim(),
        });

        if (res.success) {
          notification.success(
            res?.message || "Restaurant created successfully!",
            { duration: 4000 }
          );

          const newId = res?.data?.restaurantId || res?.restaurantId;
          if (newId) {
            localStorage.setItem("activeRestaurantId", newId);
          }

          await queryClient.invalidateQueries({ queryKey: ["restaurants"] });
          router.push("/");
        } else {
          notification.error(
            res?.message || "Failed to create restaurant.",
            { duration: 4000 }
          );
        }
      } catch (err) {
        notification.error(
          err?.response?.data?.message ||
            err?.message ||
            "Something went wrong.",
          { duration: 4000 }
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (user?.email && !formik.values.email) {
      formik.setFieldValue("email", user.email);
    }
  }, [user?.email, formik]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2 font-sans bg-background">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col pb-2 items-center gap-2 text-center">
                <img src="/assets/nearby-3.png" alt="Nearby Logo" className="h-32 sm:h-40 w-auto object-contain -mt-8 -mb-4 mix-blend-multiply contrast-125" style={{ filter: 'drop-shadow(0 0 0 white)' }} />
              </div>

              <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                  <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-background z-10">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider transition-colors ${formik.touched.name && formik.errors.name ? 'text-destructive' : 'text-slate-500 group-focus-within:text-primary'}`}>Restaurant Name</span>
                    </div>
                    <div className={`relative flex items-center border rounded-md transition-all bg-white dark:bg-zinc-900/50 ${formik.touched.name && formik.errors.name ? 'border-destructive focus-within:ring-1 focus-within:ring-destructive' : 'border-gray-300 dark:border-gray-700 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary'}`}>
                      <div className="pl-3.5 flex items-center pointer-events-none">
                        <Store className={`h-5 w-5 ${formik.touched.name && formik.errors.name ? 'text-destructive' : 'text-primary/90'}`} />
                      </div>
                      <Input 
                        id="name" 
                        name="name"
                        placeholder="e.g. The Rustic Spoon" 
                        className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-base px-3 w-full"
                        onBlur={formik.handleBlur}
                        value={formik.values.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          formik.setFieldValue("name", name);
                          if (!isSlugManual) {
                            formik.setFieldValue("slug", generateSlug(name));
                          }
                        }} 
                      />
                    </div>
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-xs text-destructive font-medium mt-1.5">{formik.errors.name}</p>
                    )}
                  </div>

                  <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-background z-10">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider transition-colors ${formik.touched.slug && formik.errors.slug ? 'text-destructive' : 'text-slate-500 group-focus-within:text-primary'}`}>Unique URL Slug</span>
                    </div>
                    <div className={`relative flex items-center border rounded-md transition-all bg-white dark:bg-zinc-900/50 ${formik.touched.slug && formik.errors.slug ? 'border-destructive focus-within:ring-1 focus-within:ring-destructive' : 'border-gray-300 dark:border-gray-700 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary'}`}>
                      <div className="pl-3.5 flex items-center pointer-events-none">
                        <Link2 className={`h-5 w-5 ${formik.touched.slug && formik.errors.slug ? 'text-destructive' : 'text-primary/90'}`} />
                      </div>
                      <Input 
                        id="slug" 
                        name="slug"
                        placeholder="the-rustic-spoon" 
                        className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-base px-3 w-full"
                        onChange={(e) => {
                          setIsSlugManual(true);
                          formik.setFieldValue("slug", e.target.value.toLowerCase().trim());
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.slug}
                      />
                    </div>
                    {formik.touched.slug && formik.errors.slug && (
                      <p className="text-xs text-destructive font-medium mt-1.5">{formik.errors.slug}</p>
                    )}
                  </div>

                  <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-background z-10">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider transition-colors ${formik.touched.phone && formik.errors.phone ? 'text-destructive' : 'text-slate-500 group-focus-within:text-primary'}`}>Phone Number</span>
                    </div>
                    <div className={`relative flex items-center border rounded-md transition-all bg-white dark:bg-zinc-900/50 ${formik.touched.phone && formik.errors.phone ? 'border-destructive focus-within:ring-1 focus-within:ring-destructive' : 'border-gray-300 dark:border-gray-700 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-primary'}`}>
                      <div className="pl-3.5 flex items-center pointer-events-none">
                        <Phone className={`h-5 w-5 ${formik.touched.phone && formik.errors.phone ? 'text-destructive' : 'text-primary/90'}`} />
                      </div>
                      <Input 
                        id="phone" 
                        name="phone"
                        placeholder="+91 9876543210" 
                        className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-base px-3 w-full"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.phone}
                      />
                    </div>
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="text-xs text-destructive font-medium mt-1.5">{formik.errors.phone}</p>
                    )}
                  </div>

                  <div className="relative group">
                    <div className="absolute -top-2.5 left-3 px-1.5 bg-white dark:bg-background z-10">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider transition-colors ${formik.touched.email && formik.errors.email ? 'text-destructive' : 'text-slate-500 group-focus-within:text-primary'}`}>Email Address</span>
                    </div>
                    <div className={`relative flex items-center border rounded-md transition-all bg-white dark:bg-zinc-900/50 opacity-70 cursor-not-allowed ${formik.touched.email && formik.errors.email ? 'border-destructive focus-within:ring-1 focus-within:ring-destructive' : 'border-gray-300 dark:border-gray-700'}`}>
                      <div className="pl-3.5 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 ${formik.touched.email && formik.errors.email ? 'text-destructive' : 'text-primary/90'}`} />
                      </div>
                      <Input 
                        id="email" 
                        name="email"
                        type="email"
                        placeholder="m@example.com" 
                        className="border-0 focus-visible:ring-0 shadow-none h-12 bg-transparent text-base px-3 w-full cursor-not-allowed"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        disabled
                      />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-xs text-destructive font-medium mt-1.5">{formik.errors.email}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 mt-2 rounded-md font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white group" 
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        Setting up restaurant...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Complete Setup
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Secured & encrypted by Clerk
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt="Restaurant Ambiance"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
