import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, http } from "@/lib/api";
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
// Every profile write returns the fresh user: refresh the query cache and
// flush the session copy so header/avatar/etc. never show stale profile data.
const useProfileSaved = () => {
    const client = useQueryClient()
    const { updateUser } = useAuth()
    return (user: unknown) => {
        client.setQueryData(authKeys.me, user)
        updateUser(user as LoginResponse["user"])
    }
}

export const useUpdateProfile = () => {
    const onSuccess = useProfileSaved()
    return useMutation({
        mutationFn: ({ dob, ...rest }: ProfileInput) =>
            api.put("/auth/update-profile", { body: { ...rest, dob: dob || null } }),
        onSuccess,
    })
}

// Multipart, so it goes through the raw axios instance (the typed client JSON-encodes bodies).
export const useUploadAvatar = () => {
    const onSuccess = useProfileSaved()
    return useMutation({
        mutationFn: async (file: File) => {
            const form = new FormData()
            form.append("avatar", file)
            const res = await http.post("/api/v1/auth/avatar", form)
            return res.data
        },
        onSuccess,
    })
}

export const useRemoveAvatar = () => {
    const onSuccess = useProfileSaved()
    return useMutation({
        mutationFn: () => api.delete("/auth/avatar"),
        onSuccess,
    })
}
