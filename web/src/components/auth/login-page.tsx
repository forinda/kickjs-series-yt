import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";
import { signInResolver } from "@/features/auth/schema";
import { useLoginMutation } from "@/features/auth/mutations";
import { useAuth } from "@/context/auth-store";
import { extractError } from "@/lib/api";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

type LoginPageProps = {
  changePage: (newPage: "login" | "register") => void;
  next: string;
};

export default function LoginPage({ changePage, next }: LoginPageProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const login = useLoginMutation();
  const form = useForm({ resolver: signInResolver, defaultValues: { email: "", password: "" } });

  const handleSubmit = form.handleSubmit((data) =>
    login.mutate(data, {
      onSuccess: (res) => {
        auth.login(res);
        toast.success("Welcome back!");
        navigate(next, { replace: true });
      },
      onError: (error) => toast.error(extractError(error, "Login failed. Please try again.")),
    }),
  );

  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to write and manage your articles.</p>
      </div>
      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="you@example.com" autoComplete="email" autoFocus className="h-10" />
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
                      <Input {...field} type="password" placeholder="Your password" autoComplete="current-password" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="h-10 w-full" disabled={login.isPending}>
                {login.isPending && <IconLoader2 className="animate-spin" />}
                Sign in
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        New to Inkwell?{" "}
        <button type="button" onClick={() => changePage("register")} className="font-medium text-primary hover:underline">
          Create an account
        </button>
      </p>
    </>
  );
}
