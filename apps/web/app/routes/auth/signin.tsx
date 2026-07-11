import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { signin } from "../../../services/auth.service";

export default function Signin() {
    const [data, setData] = useState({ email: "", password: "" });
    const mutation = useMutation({ mutationFn: signin });

    return <div>
        <div>
            <label htmlFor="email">Email : </label>
            <input
                type="email"
                name="email"
                id="email"
                value={data.email}
                onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })}
            />
        </div>
        <div>
            <label htmlFor="password">Password : </label>
            <input
                type="password"
                name="password"
                id="password"
                value={data.password}
                onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })}
            />
        </div>
        <button onClick={() => mutation.mutate(data)}>Submit</button>
    </div>
}