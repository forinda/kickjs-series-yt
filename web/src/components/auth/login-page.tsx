import { useForm } from "react-hook-form";
import { signInResolver } from "@/features/auth/schema";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useLoginMutation } from "@/features/auth/mutations";
import { toast } from "sonner";
import { extractError } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useSearchParams, useNavigate } from "react-router";
type LoginPageProps = {
  changePage: (newPage: "login" | "register") => void;
};
export default function LoginPage({ changePage }: LoginPageProps) {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const next = searchParams.get("_next");
  const form = useForm({
    resolver: signInResolver,
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const login = useLoginMutation();

  const handleSubmit = form.handleSubmit(async (data) => {
    await login.mutateAsync(data, {
      onSuccess: (res) => {
        toast.success("Login successful!");
        auth.login(res);
        navigate(next ?? "/");
      },
      onError: (error: any) => {
        const msg = extractError(error, "Login failed. Please try again.");
        toast.error(msg);
      },
    });
  });
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Form {...form}>
        <form
          action=""
          onSubmit={handleSubmit}
          className="max-w-2xl flex flex-col gap-4 border mx-auto p-8 rounded-lg"
        >
          <div>
            <h1 className="text-2xl font-bold mb-4">Login Page</h1>
          </div>
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input {...field} placeholder="example@gmail.com" autoComplete="email" />
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
                <Input
                  {...field}
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Login</Button>
          <h1>Login Page</h1>
          <p>Don't have an account? Register here.</p>
          <Button type="button" variant={"ghost"} onClick={() => changePage("register")}>
            Go to Register
          </Button>
        </form>
      </Form>
    </div>
  );
}
