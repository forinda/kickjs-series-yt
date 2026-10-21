import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";
import { signUpResolver } from "@/features/auth/schema";
import { useSignUpMutation } from "@/features/auth/mutations";
import { useAuth } from "@/context/auth-context";
import { extractError } from "@/lib/api";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

type SignUpProps = {
  changePage: (newPage: "login" | "register") => void;
  next: string;
};

export default function SignUp({ changePage, next }: SignUpProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const signUp = useSignUpMutation();
  const form = useForm({
    resolver: signUpResolver,
    defaultValues: { name: "", email: "", password: "" },
    mode: "onTouched",
  });

  const handleSubmit = form.handleSubmit((data) =>
    signUp.mutate(data, {
      onSuccess: (res) => {
        auth.login(res);
        toast.success("Account created. Welcome to Inkwell!");
        navigate(next, { replace: true });
      },
      onError: (error) => toast.error(extractError(error, "Could not create your account.")),
    }),
  );

  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground">Start publishing on Inkwell in a minute.</p>
      </div>
      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Jane Doe" autoComplete="name" autoFocus className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="you@example.com" autoComplete="email" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="At least 8 characters" autoComplete="new-password" className="h-10" />
                    </FormControl>
                    <FormDescription>Use 8 or more characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="h-10 w-full" disabled={signUp.isPending}>
                {signUp.isPending && <IconLoader2 className="animate-spin" />}
                Create account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={() => changePage("login")} className="font-medium text-primary hover:underline">
          Sign in
        </button>
      </p>
    </>
  );
}
