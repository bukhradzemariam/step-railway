
let isVerifying = false; 

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token'); 

    // თუ ტოკენი არსებობს და ვერიფიკაცია ჯერ არ დაწყებულა
    if (token && !isVerifying) {
        isVerifying = true;
        
        document.getElementById("verifySubText").textContent = "მიმდინარეობს ანგარიშის დადასტურება...";
        
        try {
            const res = await fetch("https://api.everrest.educata.dev/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });

            if (res.ok) {
                toast("ანგარიში წარმატებით დადასტურდა!", true);
                document.getElementById("verifySubText").innerHTML = 
                    "<b style='color:#16a34a'>თქვენი ანგარიში აქტიურია!</b> <br> 3 წამში გადახვალთ შესვლის გვერდზე.";
                
                setTimeout(() => {
                    window.location.href = "signin.html";
                }, 3000);
            } else {
                
                const data = await res.json().catch(() => ({}));
                toast(data.message || "ტოკენი არასწორია ან უკვე გამოყენებულია");
                document.getElementById("verifySubText").textContent = "დადასტურება ვერ მოხერხდა.";
            }
        } catch (err) {
            toast("კავშირის შეცდომა");
            isVerifying = false; 
        }
    }
};