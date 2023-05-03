import { withUser } from "./auth.js";


async function setUserPic() {
    await withUser(async (user) => {
        user.providerData.forEach(profile => {
            console.log(profile.photoURL);
            $("#userPic").attr("src", profile.photoURL);
        });
    });

    var options = {
        html: true,
        // title: "Title here",
        // content: $("#popover-content")
        content: $('[data-name="userpic-popover-content"]')

    }
    var popover = new bootstrap.Popover($("#userPicButton"), options)
} 

export { setUserPic };