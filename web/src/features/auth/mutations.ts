import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProfileInput, SignInSchema, SignUpSchema } from "./schema";
import { authKeys } from "./keys";
import { useAuth } from "@/context/auth-context";

export const useLoginMutation = () => {

    return useMutation({
        mutationFn: function (payload: SignInSchema) {
            return api.post("/auth/sign-in", {
                body: payload
            });
        }
    })

};

export type LoginResponse = NonNullable<ReturnType<typeof useLoginMutation>['data']>
export const useSignUpMutation = () => {

    return useMutation({
        mutationFn: function (payload: SignUpSchema) {
            return api.post("/auth/sign-up", {
                body: payload
            });
        }
    })

};
export const useUpdateProfile = () => {
    const client = useQueryClient()
    const { updateUser } = useAuth()
    return useMutation({
        mutationFn: ({ dob, ...rest }: ProfileInput) =>
            api.put("/auth/update-profile", { body: { ...rest, dob: dob || null } }),
        onSuccess: (user) => {
            client.setQueryData(authKeys.me, user)
            // Flush the session copy so header/avatar/etc. never show stale profile data.
            updateUser(user as unknown as LoginResponse["user"])
        },
    })
}
