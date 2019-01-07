<script>
    $(document).ready(function () {
        $('input[name="video_stall"]').click(function() {           
           $('#audio_stall').show();  
           $('#video_stall').hide();  
        });

        $('input[name="audio_stall"]').click(function() {           
           $('#audio_type').show();  
           $('#audio_stall').hide();  
        });

        $('input[name="audio_type"]').click(function() {           
           $('#audio_qual').show();  
           $('#audio_type').hide();  
        });

        $('input[name="audio_qual"]').click(function() {           
           $('#speaker').show();  
           $('#audio_qual').hide();  
        });


        $('input[name="sex"]').click(function() {           
           $('#ssh1').show();  
           $('#speaker').hide();  
        });

        $('input[name="ssh1"]').click(function() {           
           $('#ssh2').show();  
           $('#ssh1').hide();  
        });

        $('input[name="ssh2"]').click(function() {           
           $('#comments').show();  
           $('#ssh2').hide();  
        });
    });
</script>

