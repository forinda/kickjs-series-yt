
type SignUpProps = {
    changePage: (newPage: 'login' | 'register') => void;
};

export default function SignUp({ changePage }: SignUpProps) {
  return (
    <div>
        <h1>Sign Up Page</h1>
        <p>Don't have an account? Sign up here.</p>
        <button onClick={() => changePage('login')}>Go to Login</button>
    </div>
  )
}
