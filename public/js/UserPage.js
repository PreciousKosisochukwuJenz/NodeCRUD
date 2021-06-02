$(function(){
    $(".DeleteBtn").on("click",(e)=>{
        $target = $(e.target);
        const id = $target.attr("data-id");

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this file!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url : "/users/delete/"+id,
                    type:"delete",
                    success:(response)=>{
                        window.location.reload(true);
                    },
                    error:(err)=>{
                        swal("Server error!");
                    }
                })
            } else {
              swal("Cancelled");
            }
          });
       
    });
})
