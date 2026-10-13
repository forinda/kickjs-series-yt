import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SignInSchema, SignUpSchema } from "./schema";

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