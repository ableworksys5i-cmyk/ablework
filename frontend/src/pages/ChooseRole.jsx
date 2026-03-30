import { useNavigate } from "react-router-dom";

function ChooseRole(){

const navigate = useNavigate();

return(

<div>

<h2>Register as</h2>

<button onClick={()=>navigate("/register/applicant")}>
Applicant
</button>

<button onClick={()=>navigate("/register/employer")}>
Employer
</button>

</div>

);

}

export default ChooseRole;